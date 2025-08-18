use reindeer::Entity;
use serde::{Deserialize, Serialize};
use std::fmt::Debug;

pub trait ToRawEntity
where
  Self: Entity<Key = u32>,
{
  unsafe fn as_raw_entity(&self) -> &RawEntity<Self> {
    &*(self as *const Self as *const RawEntity<Self>)
  }
  unsafe fn as_mut_raw_entity(&mut self) -> &mut RawEntity<Self> {
    &mut *(self as *mut Self as *mut RawEntity<Self>)
  }
  fn into_raw_entity(self) -> RawEntity<Self> {
    RawEntity(self)
  }
}

impl<T: Entity<Key = u32>> ToRawEntity for T {}

#[derive(Default, Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct RawEntity<T>(T);

impl<T> RawEntity<T> {
  pub fn new(t: T) -> Self {
    Self(t)
  }
  pub unsafe fn from_ref(raw: &T) -> &Self {
    &*(raw as *const T as *const Self)
  }
  pub unsafe fn from_mut(raw: &mut T) -> &mut Self {
    &mut *(raw as *mut T as *mut Self)
  }
  pub fn as_entity(&self) -> &T {
    &self.0
  }
  pub fn as_mut_entity(&mut self) -> &mut T {
    &mut self.0
  }
  pub fn into_entity(self) -> T {
    self.0
  }
}

impl<T> Entity for RawEntity<T>
where
  T: Entity<Key = u32>,
{
  type Key = u32;
  fn store_name() -> &'static str {
    T::store_name()
  }
  fn get_key(&self) -> &Self::Key {
    self.0.get_key()
  }
  fn set_key(&mut self, _key: &Self::Key) {
    self.0.set_key(_key)
  }
}

#[cfg(test)]
mod tests {
  use reindeer::{bincode_deserialize, bincode_serialize};

  use super::*;

  #[test]
  fn test_raw_entity_bincode() {
    #[derive(Debug, Serialize, Deserialize, PartialEq)]
    struct TestEntity {
      key: u32,
      value: String,
    }
    let t = TestEntity {
      key: 1,
      value: "test".to_string(),
    };
    let raw = RawEntity::new(t);
    let bytes = bincode_serialize(&raw).unwrap();
    let raw2: RawEntity<TestEntity> = bincode_deserialize(&bytes).unwrap();
    assert_eq!(raw, raw2);
    let raw3: TestEntity = bincode_deserialize(&bytes).unwrap();
    assert_eq!(raw.as_entity(), &raw3);
    let bytes2 = bincode_serialize(&raw3).unwrap();
    assert_eq!(bytes, bytes2);
    let raw4: RawEntity<TestEntity> = bincode_deserialize(&bytes2).unwrap();
    assert_eq!(raw, raw4);
  }
}
