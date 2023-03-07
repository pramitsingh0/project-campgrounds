const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

async function db() {
  await mongoose.connect('mongodb://localhost:27017/project-campground');
}

mongoose.set('strictQuery', false);
// Connect to DB
db()
  .then(() => {
    console.log('Connected to db!');
  })
  .catch((e) => {
    console.error('Connection to db error: ', e);
  });
// Generate a random name using seedHelpers
const sample = array => `${array[Math.floor(Math.random() * array.length)]} ${array[Math.floor(Math.random() * array.length)]}`;

const seedDb = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: 'Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis.',
      price: price,
      image: 'https://source.unsplash.com/collection/483251'
    });
    await camp.save();
  }
};
seedDb()
  .then(() => {
    console.log('Everything successful');
    mongoose.connection.close();
  })
  .catch(e => {
    console.log(e);
  });
