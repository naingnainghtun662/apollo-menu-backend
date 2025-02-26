import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async getRoles() {
    return await this.roleService.getRoles();
  }
}
