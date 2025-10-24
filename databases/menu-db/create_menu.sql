USE restaurant_menu;

DROP TABLE IF EXISTS recipes;

CREATE TABLE recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
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


DESCRIBE recipes;


SELECT * FROM recipes;
