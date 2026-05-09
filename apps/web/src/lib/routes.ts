function withId(path: string, id: string) {
  const params = new URLSearchParams({ id });
  return `${path}?${params.toString()}`;
}

export function jobDetailHref(id: string) {
  return withId("/jobs/detail/", id);
}

export function companyDetailHref(id: string) {
  return withId("/companies/detail/", id);
}

export function adminJobEditHref(id: string) {
  return withId("/admin/jobs/edit/", id);
}

export function adminCompanyEditHref(id: string) {
  return withId("/admin/companies/edit/", id);
}
