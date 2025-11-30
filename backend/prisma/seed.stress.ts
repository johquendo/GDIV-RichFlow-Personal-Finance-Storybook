import { Prisma, PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.utils';

const prisma = new PrismaClient();

const STRESS_USER = {
    name: 'stress_user',
    email: 'stress@test.com',
    password: 'StressTest2025!',
    isAdmin: false,
    preferredCurrencyId: 1, // USD
    createdAt: new Date('2020-01-01T00:00:00Z'),
};

async function main() {
    console.log('🔥 Starting Stress Test User Seed...');
    console.log('📅 Date Range: Jan 2020 - Nov 2025');
    console.log('⚡ Target: ~1000 events per month');

    // Cleanup
    console.log('🗑️  Cleaning up existing data...');
    try {
        await prisma.event.deleteMany({ where: { User: { email: STRESS_USER.email } } });
        await prisma.financialSnapshot.deleteMany({ where: { User: { email: STRESS_USER.email } } });
        await prisma.incomeStatement.deleteMany({ where: { User: { email: STRESS_USER.email } } });
        await prisma.balanceSheet.deleteMany({ where: { User: { email: STRESS_USER.email } } });
        await prisma.cashSavings.deleteMany({ where: { User: { email: STRESS_USER.email } } });
        await prisma.user.deleteMany({ where: { email: STRESS_USER.email } });
    } catch (error) {
        console.log('   (No existing data found or error cleaning up)');
    }

    // Create User
    console.log('👤 Creating user...');
    const hashedPassword = await hashPassword(STRESS_USER.password);
    const user = await prisma.user.create({
        data: {
            name: STRESS_USER.name,
            email: STRESS_USER.email,
            password: hashedPassword,
            isAdmin: STRESS_USER.isAdmin,
            preferredCurrencyId: STRESS_USER.preferredCurrencyId,
            createdAt: STRESS_USER.createdAt,
            updatedAt: STRESS_USER.createdAt,
        },
    });

    // Init Financials
    console.log('💼 Initializing financials...');
    const incomeStatement = await prisma.incomeStatement.create({ data: { userId: user.id } });
    const balanceSheet = await prisma.balanceSheet.create({ data: { userId: user.id } });
    const cashSavings = await prisma.cashSavings.create({ data: { userId: user.id, amount: 1000 } });

    // Create a dummy expense to update repeatedly
    const expense = await prisma.expense.create({
        data: {
            name: 'Variable Expenses',
            amount: 100,
            isId: incomeStatement.id,
        },
    });

    // Create Initial Events (User Creation, etc.)
    await prisma.event.create({
        data: {
            timestamp: STRESS_USER.createdAt,
            actionType: 'CREATE',
            entityType: 'USER',
            entitySubtype: null,
            beforeValue: Prisma.DbNull,
            afterValue: { id: user.id, name: user.name, email: user.email },
            userId: user.id,
            entityId: user.id,
        },
    });

    await prisma.event.create({
        data: {
            timestamp: STRESS_USER.createdAt,
            actionType: 'CREATE',
            entityType: 'INCOME',
            entitySubtype: 'INCOME_STATEMENT',
            beforeValue: Prisma.DbNull,
            afterValue: { id: incomeStatement.id, userId: user.id },
            userId: user.id,
            entityId: incomeStatement.id,
        },
    });

    await prisma.event.create({
        data: {
            timestamp: STRESS_USER.createdAt,
            actionType: 'CREATE',
            entityType: 'EXPENSE',
            entitySubtype: null,
            beforeValue: Prisma.DbNull,
            afterValue: { name: expense.name, amount: 100 },
            userId: user.id,
            entityId: expense.id,
        },
    });

    // Loop Generation
    let currentExpenseAmount = 100;
    const startDate = new Date('2020-01-01');
    const endDate = new Date('2025-11-30');
    let currentDate = new Date(startDate);

    const eventsBatch: any[] = [];
    const BATCH_SIZE = 2000;
    let totalEvents = 0;

    console.log('🚀 Generating events...');

    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // console.log(`   Processing ${year}-${String(month + 1).padStart(2, '0')}...`);

        for (let i = 0; i < 1000; i++) {
            // Random day in month
            const day = Math.floor(Math.random() * daysInMonth) + 1;
            // Random time
            const hour = Math.floor(Math.random() * 24);
            const minute = Math.floor(Math.random() * 60);
            const second = Math.floor(Math.random() * 60);

            const eventDate = new Date(year, month, day, hour, minute, second);

            // Random amount change
            const change = parseFloat(((Math.random() - 0.5) * 20).toFixed(2)); // +/- 10
            const newAmount = parseFloat(Math.max(0, currentExpenseAmount + change).toFixed(2));

            eventsBatch.push({
                timestamp: eventDate,
                actionType: 'UPDATE',
                entityType: 'EXPENSE',
                entitySubtype: null,
                beforeValue: { name: 'Variable Expenses', amount: currentExpenseAmount },
                afterValue: { name: 'Variable Expenses', amount: newAmount },
                userId: user.id,
                entityId: expense.id,
            });

            currentExpenseAmount = newAmount;
            totalEvents++;

            if (eventsBatch.length >= BATCH_SIZE) {
                await prisma.event.createMany({ data: eventsBatch });
                eventsBatch.length = 0;
                process.stdout.write(`\r   Generated ${totalEvents} events...`);
            }
        }

        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Flush remaining
    if (eventsBatch.length > 0) {
        await prisma.event.createMany({ data: eventsBatch });
        totalEvents += eventsBatch.length;
    }

    console.log(`\n\n✅ Finished! Total events generated: ${totalEvents}`);

    // Update final expense amount in DB
    await prisma.expense.update({
        where: { id: expense.id },
        data: { amount: currentExpenseAmount },
    });

    console.log(`   Final Expense Amount: ${currentExpenseAmount}`);
    console.log(`   User Email: ${STRESS_USER.email}`);
    console.log(`   Password: ${STRESS_USER.password}`);
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
