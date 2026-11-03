// Server only. The database functions fof_list and fof_append accept only this key (the database keeps
// just its SHA-256), so the public publishable key alone cannot read or change the event log.
// FOF_DB_KEY overrides it; the hash in the fof_check function must then be updated to match.
export const DB_KEY = process.env.FOF_DB_KEY || 'fof_BcIn4FiEi6cghNb_J-BCw_-AYuemUI2wJfVNJiYHsMk';
