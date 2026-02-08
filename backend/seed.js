const { sequelize } = require('./config/database');
const { Category } = require('./models');

const defaultCategories = [
  { name: 'Food & Dining', icon: '🍔', color: '#ef4444' },
  { name: 'Transportation', icon: '🚗', color: '#3b82f6' },
  { name: 'Bills & Utilities', icon: '🏠', color: '#f59e0b' },
  { name: 'Groceries', icon: '🛒', color: '#10b981' },
  { name: 'Healthcare', icon: '💊', color: '#ec4899' },
  { name: 'Education', icon: '🎓', color: '#8b5cf6' },
  { name: 'Shopping', icon: '👕', color: '#06b6d4' },
  { name: 'Entertainment', icon: '🎬', color: '#f97316' },
  { name: 'Savings/Investment', icon: '💰', color: '#14b8a6' },
  { name: 'Gifts & Donations', icon: '🎁', color: '#f43f5e' },
  { name: 'Family/Kids', icon: '👨‍👩‍👧‍👦', color: '#a855f7' },
  { name: 'Maintenance & Repairs', icon: '🔧', color: '#64748b' },
  { name: 'Subscriptions', icon: '📱', color: '#6366f1' },
  { name: 'Other', icon: '❓', color: '#6b7280' }
];

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synced (tables created)');

    // Create default categories (userId is null for system categories)
    await Category.bulkCreate(
      defaultCategories.map(cat => ({ ...cat, userId: null, isCustom: false }))
    );
    console.log('✅ Default categories created');

    console.log('\n🎉 Database initialization complete!');
    console.log('\nDefault Categories:');
    defaultCategories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.icon} ${cat.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
