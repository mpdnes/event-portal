# PD Portal Docker Commands for Windows PowerShell
# Run: .\docker-manager.ps1 [command]

param(
    [string]$Command = "help"
)

$ErrorActionPreference = "Continue"

function Write-Green { Write-Host $args -ForegroundColor Green }
function Write-Blue { Write-Host $args -ForegroundColor Cyan }
function Write-Yellow { Write-Host $args -ForegroundColor Yellow }

Write-Blue "`n=== PD Portal Docker Manager ===`n"

switch ($Command) {
    "start" {
        Write-Green "Starting Docker containers..."
        docker-compose up -d
        Write-Green "✅ Containers started"
        Write-Host "PostgreSQL: localhost:5432"
        Write-Host "Backend should connect automatically with existing .env"
    }
    
    "stop" {
        Write-Yellow "Stopping Docker containers..."
        docker-compose down
        Write-Green "✅ Containers stopped"
    }
    
    "restart" {
        Write-Yellow "Restarting Docker containers..."
        docker-compose restart
        Write-Green "✅ Containers restarted"
    }
    
    "clean" {
        Write-Yellow "Removing containers and volumes (WARNING: deletes database)"
        $confirm = Read-Host "Are you sure? (y/n)"
        if ($confirm -eq "y") {
            docker-compose down -v
            Write-Green "✅ Cleaned up"
        }
    }
    
    "logs" {
        Write-Blue "Showing PostgreSQL logs..."
        docker-compose logs -f postgres
    }
    
    "pgadmin" {
        Write-Green "Starting pgAdmin..."
        Write-Host "URL: http://localhost:5050"
        Write-Host "Email: admin@example.com"
        Write-Host "Password: admin"
        docker-compose --profile debug up -d pgadmin
    }
    
    "shell" {
        Write-Green "Opening PostgreSQL shell..."
        docker-compose exec postgres psql -U postgres -d pd_portal
    }
    
    "status" {
        Write-Blue "Container status:"
        docker-compose ps
    }
    
    "backup" {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupFile = "postgres_backup_$timestamp.sql"
        Write-Green "Creating database backup: $backupFile"
        docker-compose exec -T postgres pg_dump -U postgres pd_portal | Out-File $backupFile
        Write-Green "✅ Backup created: $backupFile"
    }
    
    "restore" {
        if (-not $args[1]) {
            Write-Yellow "Usage: .\docker-manager.ps1 restore [backup-file.sql]"
            Write-Host "Example: .\docker-manager.ps1 restore postgres_backup_20231117_120000.sql"
            return
        }
        $backupFile = $args[1]
        if (-not (Test-Path $backupFile)) {
            Write-Host "Backup file not found: $backupFile" -ForegroundColor Red
            return
        }
        Write-Yellow "Restoring database from: $backupFile"
        Get-Content $backupFile | docker-compose exec -T postgres psql -U postgres pd_portal
        Write-Green "✅ Database restored"
    }
    
    default {
        Write-Host "Usage: .\docker-manager.ps1 [command]`n" -ForegroundColor Cyan
        Write-Host "Commands:" -ForegroundColor Cyan
        Write-Host "  start     - Start all containers"
        Write-Host "  stop      - Stop all containers"
        Write-Host "  restart   - Restart all containers"
        Write-Host "  clean     - Remove containers and volumes (deletes data!)"
        Write-Host "  logs      - Show PostgreSQL logs"
        Write-Host "  pgadmin   - Start pgAdmin (UI for database management)"
        Write-Host "  shell     - Open PostgreSQL shell"
        Write-Host "  status    - Show container status"
        Write-Host "  backup    - Create database backup"
        Write-Host "  restore   - Restore database from backup"
    }
}
