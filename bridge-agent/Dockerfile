# Bridge Agent Dockerfile - Playwright + Chromium
# Uses official Playwright base image for pre-installed browser

FROM mcr.microsoft.com/playwright:v1.53.0-jammy AS base
WORKDIR /app

# Install Node.js dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Create required directories
RUN mkdir -p downloads screenshots

# Non-root user (Playwright recommends this)
RUN groupadd -r bridge && useradd -r -g bridge -G audio,video bridge \
    && chown -R bridge:bridge /app
USER bridge

EXPOSE 43115
ENV PORT=43115
ENV HEADLESS=true
ENV NODE_ENV=production

# Start both the Express server and BullMQ worker
CMD ["node", "server.js"]
