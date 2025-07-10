
import mysql from 'mysql2/promise';
import type { Category } from './types';

// Create a connection pool to the database
// The connection details will be pulled from environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = {
  /**
   * Fetches all categories from the database.
   */
  getCategories: async (): Promise<Category[]> => {
    try {
      const [rows] = await pool.query('SELECT * FROM categories');
      // The database stores customFields as a JSON string, so we need to parse it.
      const categories = (rows as any[]).map(row => ({
        ...row,
        customFields: row.customFields ? JSON.parse(row.customFields) : [],
      }));
      return categories;
    } catch (error) {
      console.error('[DATABASE_ERROR] Failed to fetch categories:', error);
      // Return an empty array on error to prevent the app from crashing.
      return [];
    }
  },

  /**
   * Creates a new category in the database.
   */
  createCategory: async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    const { name, image, backImage, description, deliveryMethod, customFields } = categoryData;
    // We need to stringify the customFields array to store it in a JSON column.
    const customFieldsJson = JSON.stringify(customFields || []);

    try {
      const [result] = await pool.execute(
        'INSERT INTO categories (name, image, backImage, description, deliveryMethod, customFields) VALUES (?, ?, ?, ?, ?, ?)',
        [name, image, backImage, description, deliveryMethod, customFieldsJson]
      );
      
      const insertId = (result as any).insertId;
      
      const newCategory: Category = {
        id: insertId.toString(),
        ...categoryData,
      };

      return newCategory;
    } catch (error) {
       console.error('[DATABASE_ERROR] Failed to create category:', error);
       throw new Error('Failed to create category in database.');
    }
  },

  // You can add more database functions here for products, orders, etc. as you build them out.
};
