use serde::{Deserialize, Serialize};
use std::convert::TryFrom;
use uuid::Uuid;

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Id(Uuid);

impl ToString for Id {
    fn to_string(&self) -> String {
        self.0.to_string()
    }
}

impl TryFrom<&str> for Id {
    type Error = uuid::Error;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        Ok(Id(Uuid::parse_str(value)?))
    }
}

impl Clone for Id {
    fn clone(&self) -> Self {
        Id(self.0)
    }
}

impl Copy for Id {}

impl Serialize for Id {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        self.0.to_string().serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for Id {
    fn deserialize<D>(deserializer: D) -> Result<Id, D::Error>
    where
        D: serde::de::Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        Ok(Id::try_from(s.as_str()).unwrap())
    }
}
