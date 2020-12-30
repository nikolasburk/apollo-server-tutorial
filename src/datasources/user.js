const { DataSource } = require("apollo-datasource");
const isEmail = require("isemail");
// Add this to the top of the file
/**
 * @typedef { import("@prisma/client").PrismaClient } Prisma
 */

class UserAPI extends DataSource {
  /**
   * @type {Prisma}
   */
  prisma;

  constructor({ store, prisma }) {
    super();
    this.store = store;
    this.prisma = prisma;
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config) {
    this.context = config.context;
  }

  async findOrCreateUser({ email: emailArg } = {}) {
    const email =
      this.context && this.context.user ? this.context.user.email : emailArg;
    if (!email || !isEmail.validate(email)) return null;

    const user = this.prisma.user.upsert({
      where: { email },
      update: {
        email,
        token: Buffer.from(email).toString("base64"),
      },
      create: {
        email,
        token: Buffer.from(email).toString("base64"),
      },
    });
    // SEQUELIZE
    // const users = await this.store.users.findOrCreate({ where: { email } });
    return user ? user : null;
  }

  async bookTrips({ launchIds }) {
    const userId = this.context.user.id;
    if (!userId) return;

    let results = [];

    // for each launch id, try to book the trip and add it to the results array
    // if successful
    for (const launchId of launchIds) {
      const res = await this.bookTrip({ launchId });
      if (res) results.push(res);
    }

    return results;
  }

  async bookTrip({ launchId }) {
    const userId = this.context.user.id;

    const res = await this.prisma.trip.upsert({
      where: {
        launchId_userId: {
          launchId: Number(launchId),
          userId,
        },
      },
      update: {
        launchId: Number(launchId),
        user: {
          connect: {
            id: userId
          }
        }
      },
      create: {
        launchId: Number(launchId),
        user: {
          connect: {
            id: userId
          }
        }
      }
    });
    // SEQUELIZE
    // const res = await this.store.trips.findOrCreate({
    //   where: { userId, launchId },
    // });

    return res ? res : false;
  }

  async cancelTrip({ launchId }) {
    const userId = this.context.user.id;
    return this.prisma.trip.delete({
      where: {
        launchId_userId: {
          launchId: Number(launchId),
          userId
        }
      }
    })
    // SEQUELIZE
    // return !!this.store.trips.destroy({ where: { userId, launchId } });
  }

  async getLaunchIdsByUser() {
    const userId = this.context.user.id;
    // const found = await this.store.trips.findAll({
    //   where: { userId },
    // });
    const found = await this.prisma.trip.findMany({
      where: { userId },
    })
    return found
      ? found.map((t) => t.launchId).filter((t) => !!l)
      : [];
  }

  async isBookedOnLaunch({ launchId }) {
    if (!this.context || !this.context.user) return false;
    const userId = this.context.user.id;
    const found = await this.store.trips.findAll({
      where: { userId, launchId },
    });
    return found && found.length > 0;
  }
}

module.exports = UserAPI;
