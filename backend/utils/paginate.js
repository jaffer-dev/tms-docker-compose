exports.paginate = async (Model, query = {}, options = {}) => {
    const page  = parseInt(options.page, 10)  || 1;    // current page
    const limit = parseInt(options.limit, 10) || 10;   // per page
    const skip  = (page - 1) * limit;
  
    // Optional sorting & projection
    const sort       = options.sort || { createdAt: -1 };
    const projection = options.projection || null;
  
    const [data, total] = await Promise.all([
      Model.find(query, projection).sort(sort).skip(skip).limit(limit),
      Model.countDocuments(query)
    ]);
  
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    };
  };
  