console.log("This script populates the db with instruments, brands and categories");

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Instrument = require("./models/instrument");
const Brand = require("./models/brand");
const Category = require("./models/category");

const instruments = [];
const brands = [];
const categories = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createBrand();
  await createCategory();
  await createInstrument();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function brandCreate(name, description, year) {
    const brand = new Brand({ name: name, description: description, year: year });
    await brand.save();
    brands.push(brand);
    console.log(`Added brand: ${name} with description: ${description} and year: ${year}`);
  }

async function categoryCreate(name, description) {
  const category = new Category({ name: name, description: description });
  await category.save();
  categories.push(category);
  console.log(`Added category: ${name} with description: ${description}`);
}

async function instrumentCreate(
  name,
  description,
  brand,
  category,
  price,
  stock
) {
  instrumentdetail = {
    name: name,
    description: description,
    price: price,
    stock: stock,
  };
  if (brand != false) instrumentdetail.brand = brand;
  if (category != false) instrumentdetail.category = category;

  const instrument = new Instrument(instrumentdetail);
  await instrument.save();
  instruments.push(instrument);
  console.log(`Added instrument: ${name}`);
}

async function createBrand() {
    console.log("Adding brands");
    await Promise.all([
        brandCreate("Fender", "The Fender Musical Instruments Corporation is an American manufacturer of instruments and amplifiers.", 1946),
        brandCreate("Gibson", "Gibson Brands Inc. is an American manufacturer of guitars, other musical instruments, and professional audio equipment from Kalamazoo, Michigan, and now based in Nashville, Tennessee. The company was formerly known as Gibson Guitar Corporation and renamed Gibson Brands Inc. on June 11, 2013.", 1906),
        brandCreate("Ibanez", "Ibanez is a Japanese guitar brand owned by Hoshino Gakki. Based in Nagoya, Aichi, Japan, Hoshino Gakki were one of the first Japanese musical instrument companies to gain a significant foothold in import", 1957),
        brandCreate("Yamaha", "Yamaha Corporation is a Japanese musical instrument and audio equipment manufacturer. It is one of the constituents of Nikkei 225 and is the world's largest musical instrument manufacturing company.", 1887),
    ]);
}

async function createCategory() {
  console.log("Adding categories");
  await Promise.all([
    categoryCreate(
      "Acoustic guitar",
      "An acoustic guitar is a musical instrument in the string family. When a string is plucked, its vibration is transmitted from the bridge, resonating throughout the top of the guitar."
    ),
    categoryCreate("Electric guitar", "An electric guitar is a guitar that requires external amplification in order to be heard at typical performance volumes, unlike a standard acoustic guitar. It uses one or more pickups to convert the vibration of its strings into electrical signals, which ultimately are reproduced as sound by loudspeakers."),
    categoryCreate(
      "Bass guitar",
      "The bass guitar, electric bass or simply bass is the lowest-pitched member of the guitar family. It is a plucked string instrument similar in appearance and construction to an electric or acoustic guitar, but with a longer neck and scale length, and typically four to six strings or courses."
    ),
    categoryCreate("Drum kit", "A drum kit is a collection of drums, cymbals, and sometimes other auxiliary percussion instruments set up to be played by one person. The drummer typically holds a pair of matching drumsticks, and uses their feet to operate hi-hat and bass drum pedals."),
  ]);
}

async function createInstrument() {
  console.log("Adding instruments");

  await Promise.all([
    instrumentCreate(
      "AMERICAN PROFESSIONAL II STRATOCASTER",
      "The American Professional II Stratocaster® draws from more than sixty years of innovation, inspiration and evolution to meet the demands of today's working player.",
      brands[0],
      categories[1],
      699.99,
      10
    ),
    instrumentCreate(
        "J-35 30s Faded",
        "The J-35 evolved from the Jumbo in 1936, a time when the Great Depression was still wreaking havoc on Americans. Gibson developed the J-35 to be a pared-down model that still offered musicians a warm and balanced instrument. The J-35 30s Faded delivers every bit of the seasoned, vintage look, feel, and sound of our iconic J-35, with a satin nitrocellulose finish that only adds to its rich legacy and undeniable vintage vibe. Discerning flattop players will love the rich, full-bodied tone from this vintage-inspired, round-shoulder beauty, along with its superb playability and simple aesthetic charm. Includes a hardshell case.",
        brands[1],
        categories[0],
        2199.99,
        5
    ),
    instrumentCreate(
        "Les Paul Special Tribute - P-90",
        "The all-new Gibson Les Paul Special Tribute offers players a new take on a classic design. Time-tested P-90 pickups offer up a roaring tone that is undeniably Gibson. Vintage deluxe white button tuners and a compensated wrap-around tailpiece keep things simple and elegant. Comfort and playability will always be on tap thanks to the Rounded profile maple neck and true rosewood fingerboard. You could say that this one is a sonic special delivery. Available in four distinct satin finishes – Worn White, Vintage Cherry, Ebony, and Natural Walnut.",
        brands[1],
        categories[1],
        999.00,
        13
    ),
    instrumentCreate(
        "JS2GD",
        "To honor the world-renowned Joe Satriani Signature Series, the Ibanez R&D team worked closely with Joe to develop a finish that was worthy of both Joe's approval, and of the Gold Boy moniker. Each and every JS2 Gold Boy will have passed stringent Ibanez quality control standards, however due to the unique nature of this striking finish, some minor imperfections may be expected, are considered normal.",
        brands[2],
        categories[2],
        1799.99,
        2
    ),
    instrumentCreate(
        "Absolute Hybrid Maple",
        "Created from the sound up. Absolute expression without compromise",
        brands[3],
        categories[3],
        5400.00,
        8
    ),
  ]);
}