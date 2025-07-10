--
-- TopUp Hub Database Schema
--
-- This SQL file defines the structure for all necessary tables.
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--
CREATE TABLE `users` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `isAdmin` BOOLEAN DEFAULT FALSE,
  `avatar` TEXT,
  `walletBalance` DECIMAL(10, 2) DEFAULT 0.00,
  `totalSpent` DECIMAL(10, 2) DEFAULT 0.00,
  `valhallaCoins` INT DEFAULT 0,
  `nameStyle` VARCHAR(50) DEFAULT 'default',
  `premium_status` ENUM('active', 'cancelled'),
  `premium_subscribedAt` DATETIME,
  `premium_expiresAt` DATETIME,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--
CREATE TABLE `categories` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `image` TEXT,
  `backImage` TEXT,
  `description` TEXT,
  `deliveryMethod` ENUM('manual', 'instant') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `category_custom_fields`
--
CREATE TABLE `category_custom_fields` (
  `id` VARCHAR(255) NOT NULL,
  `categoryId` VARCHAR(255) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('text', 'email', 'number') NOT NULL,
  `placeholder` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--
CREATE TABLE `products` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `image` TEXT,
  `aiHint` TEXT,
  `categoryId` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--
CREATE TABLE `product_variants` (
  `id` VARCHAR(255) NOT NULL,
  `productId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `product_details`
--
CREATE TABLE `product_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `productId` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--
CREATE TABLE `orders` (
  `id` VARCHAR(255) NOT NULL,
  `customerId` VARCHAR(255) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  `paymentMethodId` VARCHAR(255),
  `paymentProofImage` TEXT,
  `status` ENUM('pending', 'completed', 'refunded') NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `refundReason` TEXT,
  `refundedAt` DATETIME,
  `appliedCouponCode` VARCHAR(255),
  `discountAmount` DECIMAL(10, 2),
  `valhallaCoinsApplied` INT,
  `valhallaCoinsValue` DECIMAL(10, 2),
  `reviewPrompted` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`customerId`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--
CREATE TABLE `order_items` (
  `id` VARCHAR(255) NOT NULL,
  `orderId` VARCHAR(255) NOT NULL,
  `productId` VARCHAR(255) NOT NULL,
  `variantId` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `customFieldValues` JSON,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--
CREATE TABLE `stock` (
  `id` VARCHAR(255) NOT NULL,
  `productId` VARCHAR(255) NOT NULL,
  `code` TEXT NOT NULL,
  `isUsed` BOOLEAN DEFAULT FALSE,
  `addedAt` DATETIME NOT NULL,
  `usedAt` DATETIME,
  `orderId` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--
CREATE TABLE `coupons` (
  `id` VARCHAR(255) NOT NULL,
  `code` VARCHAR(255) NOT NULL,
  `discountType` ENUM('percentage', 'fixed') NOT NULL,
  `value` DECIMAL(10, 2) NOT NULL,
  `expiresAt` DATETIME,
  `usageLimit` INT NOT NULL,
  `timesUsed` INT DEFAULT 0,
  `firstPurchaseOnly` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--
CREATE TABLE `reviews` (
  `id` VARCHAR(255) NOT NULL,
  `reviewerName` VARCHAR(255) NOT NULL,
  `reviewerAvatar` TEXT,
  `rating` INT NOT NULL,
  `text` TEXT,
  `productId` VARCHAR(255) NOT NULL,
  `proofImage` TEXT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--
CREATE TABLE `payment_methods` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(255),
  `instructions` TEXT,
  `requiresProof` BOOLEAN DEFAULT FALSE,
  `taxRate` DECIMAL(5, 2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Note: Site content (About page, contact info, etc.) is often stored in a simpler key-value table or a 'settings' table, but for simplicity, you can manage this via environment variables or a JSON file in your deployed app.
