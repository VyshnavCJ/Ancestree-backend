const Family = require('../../models/family.model');
const generateAPIError = require('../../utils/errors');
const User = require('../../models/user.model');
const Event = require('../../models/event.model');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

module.exports.Create = async (data, mobileNumber) => {
  const family = await Family.create(data);
  await User.updateOne(
    { mobileNumber: mobileNumber },
    { familyId: family._id }
  );
  return family;
};

module.exports.UploadImage = async (productImage) => {
  if (!productImage.mimetype.startsWith('image')) {
    throw new generateAPIError('Plz upload an Image', 404);
  }
  const maxSize = 100000;
  if (productImage.size > maxSize) {
    throw new generateAPIError('Plz upload image smaller than 100kb', 404);
  }
  const result = await cloudinary.uploader.upload(productImage.tempFilePath, {
    use_filename: true,
    folder: 'file-upload'
  });
  fs.unlinkSync(productImage.tempFilePath);
  return result.secure_url;
};

module.exports.UpdateFamily = async (mobileNumber, data) => {
  const user = await User.findOne({ mobileNumber: mobileNumber });
  const family = await Family.findById(user.familyId);
  if (data?.image) family.image = data.image;
  else if (data?.history) family.history = data.history;
  else if (data?.name) family.name = data.name;
  await family.save();
  return family;
};

module.exports.CreateEvent = async (mobileNumber, data) => {
  const user = await User.findOne({ mobileNumber: mobileNumber });
  const family = await Family.findById(user.familyId);
  data.familyId = family._id;
  await Event.create(data);
};

module.exports.DeleteEvent = async (id) => {
  await Event.deleteOne({ _id: id });
};

module.exports.ViewEvent = async (mobileNumber, date) => {
  const user = await User.findOne({ mobileNumber: mobileNumber });
  const family = await Family.findById(user.familyId);
  const todayEvents = await Event.find({
    familyId: family._id,
    date: date
  }).sort({ date: 'asc' });
  const events = await Event.find({ familyId: family._id }).sort({
    date: 'asc'
  });
  return { events, todayEvents };
};

module.exports.EventNotification = async (mobileNumber, date) => {
  const user = await User.findOne({ mobileNumber: mobileNumber });
  const family = await Family.findById(user.familyId);
  const todayEvents = await Event.find({ familyId: family._id, date: date })
    .select('-place -createdAt -updatedAt -familyId -__v')
    .sort({ date: 'asc' });
  const events = await Event.find({ familyId: family._id })
    .select('-place -createdAt -updatedAt -familyId -__v')
    .sort({ date: 'asc' })
    .limit(25);
  return { events, todayEvents };
};
