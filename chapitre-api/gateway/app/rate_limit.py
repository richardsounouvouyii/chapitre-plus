"""Rate-limit mémoire anti-bruteforce (login gateway)."""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque


class SlidingWindowRateLimiter:
    def __init__(self, *, limit: int, window_seconds: int) -> None:
        self.limit = max(1, limit)
        self.window_seconds = max(1, window_seconds)
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        cutoff = now - self.window_seconds
        with self._lock:
            bucket = self._hits[key]
            while bucket and bucket[0] < cutoff:
                bucket.popleft()
            if len(bucket) >= self.limit:
                return False
            bucket.append(now)
            return True


# Instance partagée — reconfigurée via configure_login_limiter (ne pas importer
# l'objet directement dans les modules : utiliser get_login_limiter()).
_login_limiter = SlidingWindowRateLimiter(limit=10, window_seconds=60)


def get_login_limiter() -> SlidingWindowRateLimiter:
    return _login_limiter


def configure_login_limiter(*, limit: int, window_seconds: int) -> SlidingWindowRateLimiter:
    global _login_limiter
    _login_limiter = SlidingWindowRateLimiter(limit=limit, window_seconds=window_seconds)
    return _login_limiter