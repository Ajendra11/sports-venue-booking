/**
 * Promote (or demote) an existing account.
 *
 *   npm run make-admin -- you@example.com
 *   npm run make-admin -- you@example.com --demote
 *   npm run make-admin -- --list
 *
 * There is deliberately no way to self-promote through the API — the first
 * admin has to be created out-of-band, with database access.
 */
import mongoose from 'mongoose';
import '../config/env.js';
import Auth from '../models/authModel.js';

const args = process.argv.slice(2);
const wantsList = args.includes('--list');
const demote = args.includes('--demote');
const email = args.find((a) => !a.startsWith('--'))?.toLowerCase();

const usage = () => {
  console.log(`
Usage:
  npm run make-admin -- <email>            Promote an account to admin
  npm run make-admin -- <email> --demote   Demote an admin back to user
  npm run make-admin -- --list             List all admin accounts
`);
};

async function main() {
  if (!wantsList && !email) {
    usage();
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  if (wantsList) {
    const admins = await Auth.find({ role: 'admin' }).select('name email createdAt');
    if (admins.length === 0) {
      console.log('No admin accounts yet. Promote one with: npm run make-admin -- <email>');
    } else {
      console.log(`${admins.length} admin account(s):`);
      admins.forEach((a) => console.log(`  • ${a.name} <${a.email}>`));
    }
    await mongoose.connection.close();
    return;
  }

  const user = await Auth.findOne({ email });

  if (!user) {
    console.error(`✗ No account found for "${email}".`);
    console.error('  Register through the app first, then run this again.');
    await mongoose.connection.close();
    process.exit(1);
  }

  const nextRole = demote ? 'user' : 'admin';

  if (user.role === nextRole) {
    console.log(`• ${user.email} is already "${nextRole}" — nothing to do.`);
    await mongoose.connection.close();
    return;
  }

  user.role = nextRole;
  await user.save();

  console.log(`✓ ${user.name} <${user.email}> is now "${nextRole}".`);
  if (nextRole === 'admin') {
    console.log('  Sign out and back in to refresh the session, then open /admin.');
  }

  await mongoose.connection.close();
}

main().catch(async (error) => {
  console.error('✗ Failed:', error.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
