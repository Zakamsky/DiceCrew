import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
  code:      { type: String, required: true, unique: true, uppercase: true },
  name:      { type: String, default: '' },
  createdBy: { type: String, default: 'anonymous' },
  status:    { type: String, enum: ['active', 'closed'], default: 'active' },
}, { timestamps: true })

export default mongoose.model('Room', roomSchema)
