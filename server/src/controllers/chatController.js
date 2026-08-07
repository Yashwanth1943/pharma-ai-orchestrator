const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Access or Create a 1-on-1 Chat
// @route   POST /api/chat/
// @access  Private
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'UserId param not sent with request' });
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('users', '-password')
      .populate('latestMessage');

    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'name email role',
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: 'sender',
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password'
      );
      res.status(200).json(FullChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chat/
// @access  Private
const fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'name email role',
        });
        
        // Add unread count for each chat
        const chatsWithUnread = await Promise.all(results.map(async (chat) => {
          const unreadCount = await Message.countDocuments({
            chat: chat._id,
            read: false,
            sender: { $ne: req.user._id }
          });
          return { ...chat.toObject(), unreadCount };
        }));

        res.status(200).send(chatsWithUnread);
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create New Group Chat
// @route   POST /api/chat/group
// @access  Private
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'Please Fill all the feilds' });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send({ message: 'More than 2 users are required to form a group chat' });
  }

  users.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/chat/message
// @access  Private
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!chatId) {
    return res.status(400).json({ message: 'Invalid data passed into request' });
  }
  
  if (!content && !req.file) {
    return res.status(400).json({ message: 'Message content or file is required' });
  }

  var newMessage = {
    sender: req.user._id,
    content: content || '',
    chat: chatId,
    read: false
  };
  
  // If a file was uploaded, attach it
  if (req.file) {
    newMessage.fileUrl = `/uploads/${req.file.filename}`;
    newMessage.fileType = req.file.mimetype;
  }

  try {
    var message = await Message.create(newMessage);

    message = await message.populate('sender', 'name role');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name email role',
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all Messages for a Chat
// @route   GET /api/chat/message/:chatId
// @access  Private
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name email role')
      .populate('chat');
      
    // Mark messages as read for this user
    await Message.updateMany(
      { chat: req.params.chatId, sender: { $ne: req.user._id }, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get total unread messages count for current user
// @route   GET /api/chat/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    // Find all chats the user is part of
    const userChats = await Chat.find({ users: req.user._id }).select('_id');
    const chatIds = userChats.map(chat => chat._id);

    const count = await Message.countDocuments({
      chat: { $in: chatIds },
      read: false,
      sender: { $ne: req.user._id }
    });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get support contact (for customers)
// @route   GET /api/chat/support-contact
// @access  Private
const getSupportContact = async (req, res) => {
  try {
    let support = await User.findOne({ role: 'Service Agent', isActive: true }).select('name email role');
    if (!support) {
      support = await User.findOne({ role: 'Admin', isActive: true }).select('name email role');
    }
    if (!support) {
      return res.status(404).json({ message: 'No support contact available' });
    }
    res.json(support);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  sendMessage,
  allMessages,
  getUnreadCount,
  getSupportContact
};
