'use server';

import { eq, and } from 'drizzle-orm';
import { db, products, SelectProduct } from 'lib/db';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import { auth } from '@/lib/auth';
import { alibabaSlice } from '@/lib/features/api/alibaba-slice';

interface Product {
  id: string;
  title: string;
  price: string;
  imageUrl: string | undefined;
}
interface ProductList {
  products: Product[],
  paging: Page
}
interface Page {
  current: number,
  first: number,
  last: number,
  size: number,
}

async function crawling(url: string, page: number): Promise<ProductList> {
  const response = await fetch(url);
  const html = await response.text();
  const $ = load(html);

  const products: Product[] = [];
  const paging: Page = {
    current: page,
    first: 0,
    last: 0,
    size: 0,
  }
  const script = $('#searchResultPaging').next('script').html();
  if (script) {
    const pattern = /searchResultPaging'\), (\{[\s|a-zA-Z|0-9|:|'|,]*\})/;
    const match = script.match(pattern);

    if (match) {
      const pageText = match[1];
      const pageJson = pageText
        .replace(/'/g, '"') // 작은따옴표를 큰따옴표로 변경
        .replace(/\n/g, '') // 줄바꿈 문자 제거
        .replace(/(\w+):/g, '"$1":'); // 속성 이름을 큰따옴표로 감싸기
      const pageData = JSON.parse(pageJson);
      if (pageData && pageData.total && pageData.size) {
        paging.first = 1;
        paging.last = Math.floor((pageData.total / pageData.size) + 1);
        paging.size = pageData.size;
      }
    }

  }

  $('#searchPageList .ui-item').each((index, element) => {
    const item = $(element).find('.ui-item__link');
    if (!item || !item.attr('data-ga-params')) return;
    const json = JSON.parse(item.attr('data-ga-params') as string);
    const product = json.items[0];
    const image = item.find('img')?.attr('data-srcset');

    products.push({ id: product.item_id, title: product.item_name, price: product.price, imageUrl: image });
  });

  return {
    products,
    paging: paging,
  };
}

function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

function stringToUniqueInt(str: string): number {
  let uniqueInt = 0;
  if (isNumeric(str)) {
    return parseInt(str);
  }
  for (let i = 0; i < str.length; i++) {
      uniqueInt = uniqueInt * 31 + str.charCodeAt(i);
  }
  return uniqueInt;
}

export async function deleteProduct(formData: FormData) {
  // let id = Number(formData.get('id'));
  // await deleteProductById(id);
  // revalidatePath('/');
}

export async function addProduct(formData: FormData) {
  const session = await auth();
  const username = formData.get('username') as string;
  if (!session || !session.user || username !== session.user.name) return;

  console.log('begin crawling');
  await db.delete(products).where(and(
    eq(products.ownerId, username), eq(products.provider, 'alibaba')));

  const search = new URLSearchParams({
    dispCategoryNo: "2110558899",
    pageId: "1731906980764",
    preCornerNo: "R01402001_category",
    page: "1",
    from: "0",
  });

  const list: SelectProduct[] = [];

  if (list.length > 0)
    await db.insert(products).values(list);
}

export async function addProduct1(formData: FormData) {
  const session = await auth();
  const username = formData.get('username') as string;
  if (!session || !session.user || username !== session.user.name) return;

  console.log('begin crawling');
  await db.delete(products).where(eq(products.ownerId, username));

  const search = new URLSearchParams({
    dispCategoryNo: "2110558899",
    pageId: "1731906980764",
    preCornerNo: "R01402001_category",
    page: "1",
    from: "0",
  });

  const list: SelectProduct[] = [];
  for (let page=1; true; page++) {
    const url = `https://www.elandmall.co.kr/c/ctg?${search.toString()}`;
    const result = await crawling(url, page);
    if (result && result.products && result.products.length > 0) {
      result.products.forEach((product) => {
        list.push({
          id: stringToUniqueInt(product.id),
          ownerId: username || "",
          imageUrl: product.imageUrl || "",
          name: product.title,
          status: "active",
          provider: "eland",
          stock: 0,
          price: product.price,
          availableAt: new Date(),
        })
      });
    }
    if ((page+1) > result.paging.last) break;
    search.set("page", (page+1).toString());
    search.set("from", (page*result.paging.size+1).toString());
  }
  await db.insert(products).values(list);
}