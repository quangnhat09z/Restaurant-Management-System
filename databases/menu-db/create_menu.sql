CREATE DATABASE IF NOT EXISTS restaurant_menu;
USE restaurant_menu;
CREATE TABLE recipes (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  ingredients JSON,
  instructions JSON,
  prepTimeMinutes INT,
  cookTimeMinutes INT,
  servings INT,
  difficulty VARCHAR(50),
  cuisine VARCHAR(100),
  caloriesPerServing INT,
  tags JSON,
  userId INT,
  image VARCHAR(255),
  rating FLOAT,
  reviewCount INT,
  mealType JSON,
  price INT
);
