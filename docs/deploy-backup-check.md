# Backup runtime check and Railway deployment notes

## What was checked

- `backend/src/main/java/com/techstore/service/backup/BackupCommandService.java`
- `backend/src/main/java/com/techstore/service/backup/BackupScheduler.java`
- `backend/src/main/resources/application.yml`
- `backend/nixpacks.toml`
- `backend/Dockerfile`
- `docker-compose.yml`

## Current backup flow

The backup flow uses native OS tools:

- `pg_dump` for creating a database dump
- `psql` for restoring a backup

That means the runtime image must contain PostgreSQL client tools. If those binaries are missing, the backup will fail before any DB data is exported.

## Railway / Nixpacks status

The backend has a Nixpacks config that installs:

- `postgresql-client`
- `maven`
- `openjdk17`

So if Railway is building from `backend/nixpacks.toml`, the image should include `pg_dump` and `psql`.

However, if Railway is using a custom Dockerfile or a different build path, the runtime must also install `postgresql-client` there.

## Docker status

`backend/Dockerfile` was updated to install `postgresql-client` in the runtime image, so Docker-based deployments should now have `pg_dump` and `psql` available.

## New detailed logs

The backup service now logs each step:

- backup start with DB host/port and target file name
- temp file creation
- `pg_dump` command preparation
- process start
- stream copy into gzip file
- process exit code
- upload to storage
- metadata save
- cleanup of temp files

Restore flow also logs:

- start information
- file download from storage
- `psql` command preparation
- process start
- streaming into DB
- exit code
- temp file cleanup

## Practical verification on Railway

To confirm the real runtime has `pg_dump`, check the deployment logs after a backup run. You should see logs like:

- `[BACKUP][CREATE] pg_dump command prepared`
- `[BACKUP][CREATE] pg_dump process started`
- `[BACKUP][CREATE] pg_dump finished with exitCode=0`

If the binary is missing, the logs will show a startup failure around `ProcessBuilder.start()` and the PATH will be included in the error log.

## Recommendation

- Prefer Railway builds from `backend/nixpacks.toml` if possible.
- Keep `postgresql-client` installed in both Nixpacks and Docker runtime to avoid environment drift.
- Use the new logs to identify whether the failure is caused by:
  - missing binary
  - bad DB credentials
  - network connectivity to PostgreSQL
  - storage upload failure
  - temp file permission issues
