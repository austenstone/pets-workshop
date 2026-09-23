import argparse
import json
import sqlite3
from pathlib import Path


def parse_args() -> argparse.Namespace:
    client_dir = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(
        description="Export the Tailspin Shelter SQLite snapshot for the static Pages preview."
    )
    parser.add_argument(
        "--database",
        type=Path,
        default=client_dir.parent / "server" / "dogshelter.db",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=client_dir / "src-preview" / "data" / "dogs.json",
    )
    return parser.parse_args()


def export_dogs(database: Path, output: Path) -> int:
    if not database.is_file():
        raise FileNotFoundError(f"SQLite database not found: {database}")

    with sqlite3.connect(database) as connection:
        connection.row_factory = sqlite3.Row
        rows = connection.execute(
            """
            SELECT
                dogs.id,
                dogs.name,
                breeds.name AS breed,
                dogs.age,
                dogs.description,
                dogs.gender,
                dogs.status
            FROM dogs
            JOIN breeds ON breeds.id = dogs.breed_id
            ORDER BY dogs.id
            """
        ).fetchall()

    if not rows:
        raise RuntimeError(f"No dogs found in SQLite database: {database}")

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        f"{json.dumps([dict(row) for row in rows], indent=2)}\n",
        encoding="utf-8",
    )
    return len(rows)


def main() -> None:
    args = parse_args()
    count = export_dogs(args.database.resolve(), args.output.resolve())
    print(f"Exported {count} dogs to {args.output}")


if __name__ == "__main__":
    main()
