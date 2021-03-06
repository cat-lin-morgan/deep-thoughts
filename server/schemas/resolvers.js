const { User, Thought } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                .populate('thoughts')
                .populate('friends');
            
                return userData;
            }
            
            throw new AuthenticationError('Not logged in');
        },
        thoughts: async (parent, { username }) => {
            const params = username ? { username } : {};
            return Thought.find(params).sort({ createdAt: -1 });
        },
        thought: async(parent, { _id }) => {
            return Thought.findOne({ _id });
        },
        users: async () =>{
            return User.find()
            .select('-__v -password')
            .populate('friends')
            .populate('thoughts');
        },
        user: async (parent, { username }) =>{
            return User.findOne({ username })
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts');
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            console.log(args);
            const user = await User.create(args);
            const token = signToken(user);
            console.log('test');
            return { user, token };
        },
        login: async (parent, { email, password }) => {
            // console.log(email, password);
            // console.log(await User.find({email:'test6@test.com'}));

            const user = await User.findOne({ email });
             console.log(user);
            if(!user) {
                throw new AuthenticationError('1Incorrect Info, Sir or Madam');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('2Incorrect Info, Sir or Madam')
            }
            const token = signToken(user);
            return { token, user };
        },
        addThought: async (parent, args, context) => {
            if(context.user) {
                const thought = await Thought.create({...args, username: context.user.username });

                await User.findByIdAndUpdate(
                    {_id: context.user._id },
                    { $push: { thoughts: thought._id }},
                    { new: true }
                );

                return thought;
            }
            throw new AuthenticationError('This is not the account you seek');
        },
        addReaction: async (parent, { thoughtId, reactionBody }, context) => {
            if (context.user) {
                const updatedThought = await Thought.findOneAndUpdate(
                    { _id: thoughtId },
                    { $push: { reactions: {reactionBody, username: context.user.username}}},
                    { new: true, runValidators: true }
                );
                return updatedThought;
            }
            throw new AuthenticationError('This is not the account you seek');
        },
        addFriend: async (parent, { friendId }, context) => {
            if(context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { friends: friendId }},
                    { new: true }
                ).populate('friends');
                return updatedUser;
            }
            throw new AuthenticationError('This is not the account you seek');
        }
    }
};

module.exports = resolvers;