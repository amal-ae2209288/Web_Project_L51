/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const connection = new Database(dbPath);
const adapter = new PrismaBetterSqlite3(connection);
const prisma = new PrismaClient({ adapter });
// Load JSON data 
const users = require('../data/users.json');
const posts = require('../data/posts.json');

async function main() {
    console.log(' Seeding database...');

    // Clear existing data - to avoid conflicts 
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    console.log('Cleared old data');

    // ----- Insert Users -----
    for (const u of users) {
        await prisma.user.create({
            data: {
                id: u.id,
                name: u.name,
                username: u.username,
                email: u.email || `${u.username}@example.com`, // fallback if missing
                password: u.password,
                bio: u.bio || '',
                avatar: u.avatar || '',
                createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
            }
        });
    }
    console.log(`Inserted ${users.length} users`);

    // ----- Insert Posts -----
    for (const p of posts) {
        await prisma.post.create({
            data: {
                id: p.id,
                content: p.content,
                createdAt: new Date(p.createdAt),
                authorId: p.authorId,
            }
        });
    }
    console.log(`Inserted ${posts.length} posts`);

    // ----- Insert Follows (from each user's following array) -----
    for (const u of users) {
        if (u.following && u.following.length) {
            for (const followedId of u.following) {
                try {
                    await prisma.follow.create({
                        data: { followerId: u.id, followedId }
                    });
                } catch (e) {
                    // ignore duplicate follows
                    void e;
                }
            }
        }
    }
    console.log('Inserted follow relationships');

    // ----- Insert Likes (from each post's likes array) -----
    for (const p of posts) {
        if (p.likes && p.likes.length) {
            for (const userId of p.likes) {
                try {
                    await prisma.like.create({
                        data: { userId, postId: p.id }
                    });
                } catch (e) {
                    // ignore duplicate likes
                    void e;
                }
            }
        }
    }
    console.log('Inserted likes');

    // ----- Insert Comments (from each post's comments array) -----
    for (const p of posts) {
        if (p.comments && p.comments.length) {
            for (const c of p.comments) {
                try {
                    await prisma.comment.create({
                        data: {
                            id: c.id,
                            text: c.text,
                            createdAt: new Date(c.createdAt),
                            authorId: c.authorId,
                            postId: p.id
                        }
                    });
                } catch (e) {
                    console.warn(`Comment ${c.id} could not be inserted:`, e.message);
                }
            }
        }
    }
    console.log('Inserted comments');

    console.log('Seeding complete!');

}

main()
  .catch(e => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });