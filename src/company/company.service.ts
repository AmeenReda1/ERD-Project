import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { User } from 'src/user/user.entity';
import { Product } from 'src/product/product.entity';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { companyPaginateConfig } from './config/pagination.cofig';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company) private companyRepsitory: Repository<Company>,
    @InjectRepository(Product) private ProductRepository: Repository<Product>,
  ) {}
  async createCompany(companyName: string): Promise<Company> {
    const companyExists = await this.companyRepsitory.findOne({
      where: { companyName },
    });
    console.log(companyExists);
    if (companyExists) {
      throw new ConflictException(`There is a Comapany With The Same Name`);
    }
    const newCompany = this.companyRepsitory.create({ companyName });
    return await this.companyRepsitory.save(newCompany);
  }
  async findOne(where: any): Promise<Company> {
    const companyExists = await this.companyRepsitory.findOne(where);
    console.log(companyExists);
    if (!companyExists) {
      throw new NotFoundException(`There isn't Company with this data`);
    }
    return companyExists;
  }
  async assignOwnerToComapny(user: User, company: Company): Promise<Company> {
    company.owner = user;

    return await this.companyRepsitory.save(company);
  }
  async assignProduct(
    comapnyId: number,
    productName: string,
  ): Promise<Company> {
    const companyExists = await this.companyRepsitory.findOne({
      where: { id: comapnyId },
    });
    if (!companyExists) {
      throw new NotFoundException(
        `There isn't Company with this id ${comapnyId}`,
      );
    }
    const product = await this.ProductRepository.findOne({
      where: { name: productName },
    });
    const productExists = companyExists.has.includes(product);
    if (productExists) {
      throw new NotFoundException(`This Product is Already Exists`);
    }
    companyExists.has.push(product);
    return await this.companyRepsitory.save(companyExists);
  }
  async findAll(query: PaginateQuery): Promise<Paginated<Company>> {
    return paginate(query, this.companyRepsitory, companyPaginateConfig);
  }
}
