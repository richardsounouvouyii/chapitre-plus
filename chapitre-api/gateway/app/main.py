"""API Gateway CHAPITRE+ — health, proxy auth Identity, rate-limit login."""

from __future__ import annotations

import httpx
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from fastapi.responses import Response as RawResponse

from app.config import get_settings
from app.metrics import LOGIN_RATE_LIMITED_TOTAL, metrics_payload
from app.rate_limit import configure_login_limiter, get_login_limiter

app = FastAPI(
    title="chapitre-gateway",
    version="0.3.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    settings = get_settings()
    configure_login_limiter(
        limit=settings.login_rate_limit,
        window_seconds=settings.login_rate_window_seconds,
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "gateway"}


@app.get("/ready")
def ready() -> dict[str, str]:
    return {"status": "ready", "service": "gateway"}


@app.get("/api/v1/health")
def api_v1_health() -> dict[str, str]:
    return {"status": "ok", "service": "gateway", "api": "v1"}


@app.get("/metrics")
def metrics() -> RawResponse:
    """Exposition Prometheus (scrape)."""
    payload, content_type = metrics_payload()
    return RawResponse(content=payload, media_type=content_type)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


@app.api_route(
    "/api/v1/auth/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def proxy_identity_auth(path: str, request: Request) -> Response:
    """Proxy auth vers identity-service ; rate-limit strict sur login."""
    if request.method == "POST" and path == "login":
        ip = _client_ip(request)
        if not get_login_limiter().allow(f"login:{ip}"):
            LOGIN_RATE_LIMITED_TOTAL.inc()
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Trop de tentatives de connexion. Réessayez plus tard.",
                },
                headers={"Retry-After": str(get_settings().login_rate_window_seconds)},
            )

    settings = get_settings()
    upstream = f"{settings.identity_service_url.rstrip('/')}/auth/{path}"
    if request.url.query:
        upstream = f"{upstream}?{request.url.query}"

    body = await request.body()
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in {"host", "content-length"}
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            upstream_response = await client.request(
                request.method,
                upstream,
                content=body,
                headers=headers,
            )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="identity-service indisponible",
        ) from exc

    excluded = {"content-encoding", "transfer-encoding", "content-length"}
    response_headers = {
        key: value
        for key, value in upstream_response.headers.items()
        if key.lower() not in excluded
    }
    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        headers=response_headers,
        media_type=upstream_response.headers.get("content-type"),
    )


@app.api_route(
    "/api/v1/catalog/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def proxy_catalog(path: str, request: Request) -> Response:
    """Proxy référentiels vers catalog-service."""
    settings = get_settings()
    upstream = f"{settings.catalog_service_url.rstrip('/')}/{path}"
    if request.url.query:
        upstream = f"{upstream}?{request.url.query}"

    body = await request.body()
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in {"host", "content-length"}
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            upstream_response = await client.request(
                request.method,
                upstream,
                content=body,
                headers=headers,
            )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="catalog-service indisponible",
        ) from exc

    excluded = {"content-encoding", "transfer-encoding", "content-length"}
    response_headers = {
        key: value
        for key, value in upstream_response.headers.items()
        if key.lower() not in excluded
    }
    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        headers=response_headers,
        media_type=upstream_response.headers.get("content-type"),
    )


@app.get("/api/v1/catalog")
@app.get("/api/v1/catalog/")
async def proxy_catalog_root(request: Request) -> Response:
    """Racine catalog → /levels (raccourci)."""
    settings = get_settings()
    upstream = f"{settings.catalog_service_url.rstrip('/')}/levels"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            upstream_response = await client.get(upstream)
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="catalog-service indisponible",
        ) from exc
    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        media_type=upstream_response.headers.get("content-type"),
    )


async def _proxy(request: Request, *, base_url: str, path: str, service_name: str) -> Response:
    upstream = f"{base_url.rstrip('/')}/{path}"
    if request.url.query:
        upstream = f"{upstream}?{request.url.query}"
    body = await request.body()
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in {"host", "content-length"}
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            upstream_response = await client.request(
                request.method,
                upstream,
                content=body,
                headers=headers,
            )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"{service_name} indisponible",
        ) from exc
    excluded = {"content-encoding", "transfer-encoding", "content-length"}
    response_headers = {
        key: value
        for key, value in upstream_response.headers.items()
        if key.lower() not in excluded
    }
    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        headers=response_headers,
        media_type=upstream_response.headers.get("content-type"),
    )


@app.api_route(
    "/api/v1/difficulties/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def proxy_difficulties(path: str, request: Request) -> Response:
    settings = get_settings()
    return await _proxy(
        request,
        base_url=f"{settings.difficulty_service_url.rstrip('/')}/difficulties",
        path=path,
        service_name="difficulty-service",
    )


@app.api_route(
    "/api/v1/difficulties",
    methods=["GET", "POST", "OPTIONS"],
)
async def proxy_difficulties_root(request: Request) -> Response:
    settings = get_settings()
    return await _proxy(
        request,
        base_url=settings.difficulty_service_url,
        path="difficulties",
        service_name="difficulty-service",
    )


@app.api_route(
    "/api/v1/trainers/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def proxy_trainers(path: str, request: Request) -> Response:
    settings = get_settings()
    return await _proxy(
        request,
        base_url=f"{settings.trainer_service_url.rstrip('/')}/trainers",
        path=path,
        service_name="trainer-service",
    )


@app.api_route(
    "/api/v1/trainers",
    methods=["GET", "POST", "OPTIONS"],
)
async def proxy_trainers_root(request: Request) -> Response:
    settings = get_settings()
    return await _proxy(
        request,
        base_url=settings.trainer_service_url,
        path="trainers",
        service_name="trainer-service",
    )


@app.api_route(
    "/api/v1/scheduling/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def proxy_scheduling(path: str, request: Request) -> Response:
    settings = get_settings()
    return await _proxy(
        request,
        base_url=settings.scheduling_service_url,
        path=path,
        service_name="scheduling-service",
    )
