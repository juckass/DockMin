import { Controller, Post, Body, UnauthorizedException, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // o el guard que uses


@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Inicia sesión y devuelve tokens de acceso y refresh.
   */
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login', description: 'Inicia sesión con email y contraseña. Devuelve accessToken, refreshToken y datos del usuario.' })
  @ApiBody({
    type: LoginDto,
    examples: {
      ejemplo: {
        summary: 'Login admin',
        value: { email: 'admin@dockmin.com', password: 'admin123' }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Login exitoso',
    schema: {
      example: {
        accessToken: '<jwt>',
        refreshToken: '<refresh-token>',
        user: { id: 1, email: 'admin@dockmin.com', rol: 'admin' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user);
  }

  /**
   * Renueva el accessToken usando un refreshToken válido.
   */
  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh token', description: 'Renueva el accessToken usando un refreshToken válido.' })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      ejemplo: {
        summary: 'Refresh',
        value: { refreshToken: '<refresh-token>' }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Nuevo accessToken generado',
    schema: {
      example: {
        accessToken: '<jwt>',
        refreshToken: '<refresh-token>'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    // Decodificar el refresh token para obtener el userId
    let payload: any;
    try {
      payload = this.authService["jwtService"].verify(refreshTokenDto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refreshsecretkey',
      });
    } catch (e) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    return this.authService.refreshToken(payload.sub, refreshTokenDto.refreshToken);
  }

  /**
   * Cierra la sesión del usuario y elimina el refreshToken.
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout', description: 'Cierra la sesión del usuario autenticado y elimina el refreshToken.' })
  @ApiResponse({ status: 200, description: 'Logout exitoso', schema: { example: { message: 'Logout exitoso' } } })
  @ApiResponse({ status: 400, description: 'No se pudo determinar el usuario autenticado' })
  async logout(@Req() req) {
    const userId = req.user?.userId;
  
    if (!userId) {
      throw new BadRequestException('No se pudo determinar el usuario autenticado');
    }
    await this.authService.logout(userId);
    return { message: 'Logout exitoso' };
  }
}
