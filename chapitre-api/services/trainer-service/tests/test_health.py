def test_health(client) -> None:
    assert client.get("/health").json()["service"] == "trainer-service"
