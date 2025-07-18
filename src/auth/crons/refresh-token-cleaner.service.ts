import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsuariosService } from '../../usuarios/usuarios.service';

@Injectable()
export class RefreshTokenCleanerService {
  private readonly logger = new Logger(RefreshTokenCleanerService.name);

  constructor(private readonly usuariosService: UsuariosService) {}

  // Ejecuta cada día a la medianoche
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const count = await this.usuariosService.cleanExpiredRefreshTokens();
    this.logger.log(`Refresh tokens expirados eliminados: ${count}`);
  }
}
