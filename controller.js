require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const pool = require('./db'); // PostgreSQL pool instance
const {checkIfUserExist} = require('./utils')

// Create Discussion
exports.createDiscussion = async (req, res) => {
    const { user_id, text, image, hashtags } = req.body;
    const id = uuidv4();

    try {

        const user = await checkIfUserExist(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newDiscussion = await pool.query(
            "INSERT INTO discussions (id, user_id, text, image) VALUES ($1, $2, $3, $4) RETURNING *",
            [id, user_id, text, image]
        );

        const discussionId = newDiscussion.rows[0].id;

        if (hashtags && hashtags.length > 0) {
            for (const tag of hashtags) {
                let hashtag = await pool.query("SELECT * FROM hashtags WHERE name = $1", [tag]);
                if (hashtag.rows.length === 0) {
                    hashtag = await pool.query("INSERT INTO hashtags (id, name) VALUES ($1, $2) RETURNING *", [uuidv4(), tag]);
                }
                await pool.query("INSERT INTO discussion_hashtags (discussion_id, hashtag_id) VALUES ($1, $2)", [discussionId, hashtag.rows[0].id]);
            }
        }

        res.status(201).json(newDiscussion.rows[0]);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
};

// Update Discussion
exports.updateDiscussion = async (req, res) => {
    const { id } = req.params;
    const { text, image, hashtags } = req.body;

    try {
        const updatedDiscussion = await pool.query(
            "UPDATE discussions SET text = $1, image = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
            [text, image, id]
        );

        await pool.query("DELETE FROM discussion_hashtags WHERE discussion_id = $1", [id]);

        if (hashtags && hashtags.length > 0) {
            for (const tag of hashtags) {
                let hashtag = await pool.query("SELECT * FROM hashtags WHERE name = $1", [tag]);
                if (hashtag.rows.length === 0) {
                    hashtag = await pool.query("INSERT INTO hashtags (id, name) VALUES ($1, $2) RETURNING *", [uuidv4(), tag]);
                }
                await pool.query("INSERT INTO discussion_hashtags (discussion_id, hashtag_id) VALUES ($1, $2)", [id, hashtag.rows[0].id]);
            }
        }

        res.status(200).json(updatedDiscussion.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDiscussion = async (req, res) => {
    const {id} = req.params;
    try {
        const discussion = await pool.query("SELECT * FROM discussions WHERE id = $1", [id]);
        if(discussion.rows[0]?.id){
            res.status(200).json(discussion.rows[0]);
        }else {
            return res.status(404).json({ error: 'Discussion not found' });
        }
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Delete Discussion
exports.deleteDiscussion = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query("DELETE FROM discussion_hashtags WHERE discussion_id = $1", [id]);
        await pool.query("DELETE FROM discussions WHERE id = $1", [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// List Discussions
exports.listDiscussions = async (req, res) => {
    try {
        const discussions = await pool.query(
            `SELECT discussions.id, discussions.text, discussions.image, discussions.created_at, discussions.updated_at
            FROM discussions`
        );
        res.status(200).json(discussions.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Search Discussions based on text
exports.searchDiscussions = async (req, res) => {
    const { text } = req.query;

    try {
        const discussions = await pool.query(
            `SELECT discussions.id, discussions.text, discussions.image, discussions.created_at, discussions.updated_at
            FROM discussions
            WHERE discussions.text ILIKE $1`,
            [`%${text}%`]
        );
        res.status(200).json(discussions.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Discussions by Tags
exports.getDiscussionsByTags = async (req, res) => {
    const { tags } = req.query;

    try {
        const discussions = await pool.query(
            `SELECT distinct(discussions.id), discussions.text, discussions.image, discussions.created_at, discussions.updated_at
            FROM discussions
            JOIN discussion_hashtags ON discussions.id = discussion_hashtags.discussion_id
            JOIN hashtags ON discussion_hashtags.hashtag_id = hashtags.id
            WHERE hashtags.name = ANY($1::text[])`,
            [tags.split(',')]
        );
        res.status(200).json(discussions.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.incrementViewCount = async (req, res) => {
    try {
        const { id } = req.params;
        const discussion = await pool.query(`UPDATE discussions
            SET view_count = view_count + 1
            WHERE id = $1
            RETURNING *;`, [id]);
        if (!discussion) {
            return res.status(404).json({ error: 'Discussion not found' });
        }
    
        return res.status(200).json(discussion.rows[0]);
    } catch (error) {
        console.error('Error incrementing view count:', error);
        return res.status(500).json({ error: err.message });
    }
};

