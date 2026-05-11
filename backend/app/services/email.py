from email.message import EmailMessage

import aiosmtplib

from backend.app.core.config import settings


class EmailService:
    async def send_invitation(self, recipient_name: str, recipient_email: str, survey_link: str) -> None:
        message = EmailMessage()
        message["From"] = settings.smtp_email
        message["To"] = recipient_email
        message["Subject"] = "Survey Invitation"
        message.set_content(
            f"Dear {recipient_name},\n\n"
            "Good day.\n\n"
            "You are invited to join the survey of ITM.\n"
            "Please click the link below to participate in the survey.\n\n"
            f"{survey_link}\n\n"
            "Regards,\n"
            "ITM\n"
        )

        await aiosmtplib.send(
            message,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            start_tls=True,
            username=settings.smtp_email,
            password=settings.smtp_password,
        )

