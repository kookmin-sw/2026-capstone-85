CREATE TABLE "AppLog" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'info',
    "source" TEXT NOT NULL DEFAULT 'FE',
    "userId" TEXT,
    "incognitoUserId" TEXT,
    "path" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AppLog_key_createdAt_idx" ON "AppLog"("key", "createdAt");
CREATE INDEX "AppLog_userId_createdAt_idx" ON "AppLog"("userId", "createdAt");
CREATE INDEX "AppLog_incognitoUserId_createdAt_idx" ON "AppLog"("incognitoUserId", "createdAt");
CREATE INDEX "AppLog_source_createdAt_idx" ON "AppLog"("source", "createdAt");

ALTER TABLE "AppLog" ADD CONSTRAINT "AppLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
