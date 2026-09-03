"""Exception hierarchy for the gateway."""

from fastapi import status


class VexalynException(Exception):
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", http_status: int = 500):
        self.message = message
        self.code = code
        self.http_status = http_status


class ProviderError(VexalynException):
    def __init__(self, message: str = "Provider error"):
        super().__init__(message, code="PROVIDER_ERROR", http_status=502)


class ApiUnavailable(VexalynException):
    def __init__(self, message: str = "API service unavailable"):
        super().__init__(message, code="API_UNAVAILABLE", http_status=503)


class ValidationError(VexalynException):
    def __init__(self, message: str = "Invalid request parameters"):
        super().__init__(message, code="VALIDATION_ERROR", http_status=400)


class AuthenticationError(VexalynException):
    def __init__(self, message: str = "Invalid or missing API key"):
        super().__init__(message, code="INVALID_API_KEY", http_status=401)
