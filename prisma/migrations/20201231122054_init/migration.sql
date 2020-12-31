-- CreateTable
CREATE TABLE "trips" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "launchId" INTEGER,
    "userId" INTEGER,

    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "email" TEXT,
    "token" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "trips.launchId_userId_unique" ON "trips"("launchId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "users.email_unique" ON "users"("email");
