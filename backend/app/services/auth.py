from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.exceptions import UnauthorizedError
from backend.app.core.security import create_access_token, verify_password
from backend.app.repositories.user import UserRepository
from backend.app.schemas.auth import LoginRequest, TokenResponse


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.user_repository = UserRepository(session)

    async def login(self, payload: LoginRequest) -> TokenResponse:
        user = await self.user_repository.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedError("User is inactive")

        return TokenResponse(access_token=create_access_token(str(user.id)))

