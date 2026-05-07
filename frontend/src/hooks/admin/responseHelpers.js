export const unwrapAdminResult = (result) => {
  if (Array.isArray(result)) {
    return {
      items: result,
      pageNumber: 0,
      pageSize: result.length,
      totalElements: result.length,
      totalPages: 1,
      first: true,
      last: true,
      hasNext: false,
      hasPrevious: false,
    }
  }

  const content = result?.content ?? result?.items ?? result?.data ?? []
  const items = Array.isArray(content) ? content : []

  return {
    items,
    pageNumber: result?.pageNumber ?? result?.number ?? 0,
    pageSize: result?.pageSize ?? result?.size ?? items.length,
    totalElements: result?.totalElements ?? items.length,
    totalPages: result?.totalPages ?? 1,
    first: result?.first ?? true,
    last: result?.last ?? true,
    hasNext: result?.hasNext ?? false,
    hasPrevious: result?.hasPrevious ?? false,
  }
}
