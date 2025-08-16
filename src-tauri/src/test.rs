use reindeer::Entity;
use reindeer::{Deserialize, Serialize};
use schemars::JsonSchema;

// Simple test schema for demonstration
#[derive(Debug, Serialize, Deserialize, JsonSchema)]
#[schemars(title = "User Profile", example=UserProfile::default())]
pub struct UserProfile {
  pub id: u32,
  #[schemars(title = "Full Name", description = "Enter your full name")]
  pub name: String,

  #[schemars(title = "Email", description = "Enter your email address")]
  pub email: String,

  #[schemars(
    title = "Age",
    description = "Enter your age",
    range(min = 0, max = 150)
  )]
  pub age: u32,

  #[schemars(title = "Is Active", description = "Whether the user is active")]
  pub is_active: bool,
}

impl Default for UserProfile {
  fn default() -> Self {
    Self {
      id: 1,
      name: "andeya".to_owned(),
      email: "andeyalee@outlook.com".to_owned(),
      age: Default::default(),
      is_active: true,
    }
  }
}

// Product configuration schema
#[derive(Debug, Serialize, Deserialize, JsonSchema)]
#[schemars(title = "Product Config", example=ProductConfig::default())]
pub struct ProductConfig {
  /// The product ID
  pub id: u32,
  #[schemars(title = "Product Name", description = "Enter the product name")]
  pub name: String,

  #[schemars(
    title = "Price",
    description = "Enter the product price",
    range(min = 0)
  )]
  pub price: f64,

  #[schemars(title = "Category", description = "Select the product category")]
  pub category: String,

  #[schemars(title = "In Stock", description = "Whether the product is in stock")]
  pub in_stock: bool,
}

impl Default for ProductConfig {
  fn default() -> Self {
    Self {
      id: 1,
      name: "craft-gui".to_owned(),
      price: 88.88,
      category: Default::default(),
      in_stock: true,
    }
  }
}

// System settings schema
#[derive(Debug, Serialize, Deserialize, JsonSchema, Default)]
#[schemars(title = "System Settings")]
pub struct SystemSettings {
  pub id: u32,
  #[schemars(title = "Theme", description = "Select the application theme")]
  pub theme: String,

  #[schemars(title = "Language", description = "Select the application language")]
  pub language: String,

  #[schemars(title = "Auto Save", description = "Enable auto save functionality")]
  pub auto_save: bool,

  #[schemars(
    title = "Max File Size",
    description = "Maximum file size in MB",
    range(min = 1, max = 1000)
  )]
  pub max_file_size: u32,
}

impl Entity for ProductConfig {
  type Key = u32;

  fn store_name() -> &'static str {
    "ProductConfig"
  }

  fn get_key(&self) -> &Self::Key {
    &self.id
  }

  fn set_key(&mut self, key: &Self::Key) {
    self.id = *key;
  }
}

impl Entity for UserProfile {
  type Key = u32;

  fn store_name() -> &'static str {
    "UserProfile"
  }

  fn get_key(&self) -> &Self::Key {
    &self.id
  }

  fn set_key(&mut self, key: &Self::Key) {
    self.id = *key;
  }
}

impl Entity for SystemSettings {
  type Key = u32;

  fn store_name() -> &'static str {
    "SystemSettings"
  }

  fn get_key(&self) -> &Self::Key {
    &self.id
  }

  fn set_key(&mut self, key: &Self::Key) {
    self.id = *key;
  }
}
