from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.core.security import hash_password
from backend.app.models.user import User
from backend.app.repositories.user import UserRepository


async def create_or_update_admin(session: AsyncSession) -> User:
    repository = UserRepository(session)
    existing = await repository.get_by_email(settings.admin_email)
    if existing is None:
        user = User(
            email=settings.admin_email,
            password_hash=hash_password(settings.admin_password),
            is_active=True,
        )
        await repository.save(user)
    else:
        existing.password_hash = hash_password(settings.admin_password)
        existing.is_active = True
        await repository.save(existing)
        user = existing

    await session.commit()
    await session.refresh(user)
    return user

