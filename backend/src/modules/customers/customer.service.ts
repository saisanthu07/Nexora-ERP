import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { buildMeta, getPagination } from '../../utils/pagination';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.schema';

interface ListParams {
  search?: string;
  status?: string;
  type?: string;
  page?: string;
  limit?: string;
}

export async function listCustomers(params: ListParams) {
  const { skip, take, page, limit } = getPagination(params);

  const where: Prisma.CustomerWhereInput = {
    ...(params.status ? { status: params.status as never } : {}),
    ...(params.type ? { type: params.type as never } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { phone: { contains: params.search, mode: 'insensitive' } },
            { businessName: { contains: params.search, mode: 'insensitive' } },
            { email: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.customer.count({ where }),
  ]);

  return { items, meta: buildMeta(page, limit, total) };
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: 'desc' } },
      challans: { orderBy: { createdAt: 'desc' }, include: { items: true } },
    },
  });
  if (!customer) throw ApiError.notFound('Customer not found');
  return customer;
}

export async function createCustomer(input: CreateCustomerInput, userId: string) {
  const { note, ...data } = input;

  return prisma.customer.create({
    data: {
      ...data,
      ...(note
        ? {
            notes: {
              create: [{ content: note, createdBy: userId }],
            },
          }
        : {}),
    },
    include: { notes: true },
  });
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  const { note, ...data } = input;
  await getCustomerById(id); // 404 if missing

  return prisma.customer.update({
    where: { id },
    data,
    include: { notes: { orderBy: { createdAt: 'desc' } } },
  });
}

export async function addNote(customerId: string, content: string, userId: string) {
  await getCustomerById(customerId); // 404 if missing

  return prisma.note.create({
    data: { customerId, content, createdBy: userId },
  });
}
