# TheNexopp Agent - Database & MinIO Backup Strategy

## 1. Automated PostgreSQL Daily Backups
Create cron job script `/opt/backups/backup_postgres.sh`:
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/backups/postgres"
mkdir -p $BACKUP_DIR

docker exec thenexopp_postgres pg_dump -U thenexopp_user thenexopp_agent_db | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Retain 30 days of backups
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
```

Set permissions and cron job:
```bash
chmod +x /opt/backups/backup_postgres.sh
crontab -e
# Add line:
0 2 * * * /opt/backups/backup_postgres.sh > /dev/null 2>&1
```

---

## 2. MinIO S3 Object Storage Sync
Sync private object storage buckets to an offsite secure backup location:
```bash
mc mirror --overwrite minio/private-kyc /opt/backups/minio/private-kyc
mc mirror --overwrite minio/property-images /opt/backups/minio/property-images
mc mirror --overwrite minio/payment-proofs /opt/backups/minio/payment-proofs
```

---

## 3. Disaster Recovery & Restoration
To restore PostgreSQL database from a backup file:
```bash
gunzip -c /opt/backups/postgres/db_20260831.sql.gz | docker exec -i thenexopp_postgres psql -U thenexopp_user -d thenexopp_agent_db
```
