from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# User Schemas
class UserBase(BaseModel):
    """Base schema for User.

    Args:
        BaseModel
    """

    name: str


class User(UserBase):
    """Schema for User.

    Args:
        UserBase
    """

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Report Schemas
class ReportBase(BaseModel):
    """Common fields for crud reports.

    Args:
        BaseModel
    """

    week_start: date
    done: str
    todo: str
    issues: Optional[str] = None
    learning_hours: float = 0.0


class ReportCreate(ReportBase):
    """Fields required POST a report.

    Args:
        ReportBase
    """

    user_id: int


class Report(ReportBase):
    """Fields required GET a report.

    Args:
        ReportBase
    """

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
