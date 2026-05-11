from backend.app.db.session import async_session_factory
from backend.app.services.admin_bootstrap import create_or_update_admin


async def main() -> None:
    async with async_session_factory() as session:
        await create_or_update_admin(session)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
