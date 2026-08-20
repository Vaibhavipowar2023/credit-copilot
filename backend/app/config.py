#Save the secrets/api_keys from environment variables

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Required
    database_url: str
    app_name: str ="Credit & Covenant Risk Copilot"
    debug: bool = False
    mineru_api_token: str | None = None
    jina_api_key: str | None = None
    mistral_api_key: str | None = None
    groq_api_key: str | None = None
    cohere_api_key: str | None = None
    jwt_secret: str = "change-this-in-env"


settings = Settings()