def test_list_levels(client) -> None:
    response = client.get("/levels")
    assert response.status_code == 200
    body = response.json()
    codes = [item["code"] for item in body["levels"]]
    assert codes == ["3e", "Terminale C", "Terminale D"]
    assert "3e" in body["label"]


def test_subjects_filtered_by_level(client) -> None:
    third = client.get("/subjects", params={"level": "3e"})
    assert third.status_code == 200
    names_3e = {item["name"] for item in third.json()["items"]}
    assert "Français" in names_3e
    assert "Mathématiques" in names_3e

    tc = client.get("/subjects", params={"level": "Terminale C"})
    names_tc = {item["name"] for item in tc.json()["items"]}
    assert "Français" not in names_tc
    assert "Mathématiques" in names_tc


def test_chapters_and_notions(client) -> None:
    subjects = client.get("/subjects", params={"level": "3e"}).json()["items"]
    maths = next(item for item in subjects if item["name"] == "Mathématiques")
    chapters = client.get(
        f"/subjects/{maths['id']}/chapters",
        params={"level": "3e"},
    )
    assert chapters.status_code == 200
    items = chapters.json()["items"]
    assert any(c["title"] == "Équations du second degré" for c in items)

    chapter_id = next(c["id"] for c in items if c["title"] == "Équations du second degré")
    notions = client.get(f"/chapters/{chapter_id}/notions")
    assert notions.status_code == 200
    titles = {n["title"] for n in notions.json()["items"]}
    assert "Discriminant" in titles


def test_unknown_level_subjects_404(client) -> None:
    response = client.get("/subjects", params={"level": "Terminale A"})
    assert response.status_code == 404
