using System;
using System.Collections.Generic;

namespace CFOS.Database.AppDbContextModels;

public partial class TblFoodCategory
{
    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = null!;

    public string? Description { get; set; }

    public int CreatedBy { get; set; }

    public bool? DeleteFlag { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual TblUser CreatedByNavigation { get; set; } = null!;

    public virtual ICollection<TblFood> TblFoods { get; set; } = new List<TblFood>();
}
