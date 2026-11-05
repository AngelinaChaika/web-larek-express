import mongoose from 'mongoose';

interface IUserToken {
  token: string;
}

interface IUser {
  name?: string;
  email: string;
  password: string;
  tokens: IUserToken[];
}

const userTokenSchema = new mongoose.Schema<IUserToken>(
  {
    token: {
      type: String,
      required: [true, 'Token is required'],
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [30, 'Name must be no more than 30 characters long'],
    default: 'Ё-мое',
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  tokens: { type: [userTokenSchema], select: false },
});

export default mongoose.model<IUser>('User', userSchema);
