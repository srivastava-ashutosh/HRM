const paginate = async (Model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = '-createdAt',
    search,
    searchFields = [],
    filters = {},
    populate = [],
    select,
  } = options;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  let mongoQuery = { ...query };

  if (search && searchFields.length > 0) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    mongoQuery.$or = searchFields.map(field => ({ [field]: regex }));
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (typeof value === 'object' && !Array.isArray(value)) {
      const op = {};
      if (value.gte) op.$gte = value.gte;
      if (value.lte) op.$lte = value.lte;
      if (value.gt) op.$gt = value.gt;
      if (value.lt) op.$lt = value.lt;
      if (Object.keys(op).length) {
        mongoQuery[key] = { ...mongoQuery[key], ...op };
        return;
      }
    }
    if (Array.isArray(value)) {
      mongoQuery[key] = { $in: value };
      return;
    }
    if (typeof value === 'boolean' || typeof value === 'number') {
      mongoQuery[key] = value;
      return;
    }
    mongoQuery[key] = new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  });

  const [data, total] = await Promise.all([
    Model.find(mongoQuery)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate(populate)
      .select(select)
      .lean(),
    Model.countDocuments(mongoQuery),
  ]);

  return {
    data,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

module.exports = paginate;
