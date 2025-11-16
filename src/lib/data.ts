import type { Package } from './types';
import { getPackagesAction, getPackageByIdAction } from './actions';

export async function getPackageById(id: string): Promise<Package | undefined> {
    return getPackageByIdAction(id);
}
