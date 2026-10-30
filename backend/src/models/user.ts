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
    token: { type: String, required: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Ё-мое',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  tokens: { type: [userTokenSchema], select: false },
});

export default mongoose.model<IUser>('User', userSchema);
