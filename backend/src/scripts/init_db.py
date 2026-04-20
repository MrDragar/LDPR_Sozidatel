import asyncio
import sys
from pathlib import Path

from src.core.containers import Container

sys.path.append(str(Path(__file__).parent.parent))

container = Container()


if __name__ == "__main__":
    asyncio.run(container.database().create_database())
