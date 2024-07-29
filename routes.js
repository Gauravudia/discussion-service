const express = require('express');
const discussionController = require('./controller');

const router = express.Router();

router.post('/', discussionController.createDiscussion);
router.put('/:id', discussionController.updateDiscussion);
router.get('/:id', discussionController.getDiscussion);
router.delete('/:id', discussionController.deleteDiscussion);
router.get('/', discussionController.listDiscussions);
router.get('/text', discussionController.searchDiscussions);
router.get('/tags', discussionController.getDiscussionsByTags);
router.get('/:id/viewCount', discussionController.incrementViewCount);

module.exports = router;
