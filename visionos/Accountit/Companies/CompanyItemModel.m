//
//  CompanyItemModel.m
//  Accountit
//
//  Created by Jinwoo Kim on 5/18/26.
//

#import "CompanyItemModel.h"

@interface CompanyItemModel ()
@property (copy, nonatomic, readonly) AccountitAPICPACompanyListItem *item;
@end

@implementation CompanyItemModel

- (instancetype)initWithItem:(AccountitAPICPACompanyListItem *)item {
    if (self = [super init]) {
        self->_item = [item copy];
    }

    return self;
}

- (void)dealloc {
    [_item release];
    [super dealloc];
}

- (NSString *)name {
    return self.item.name;
}

- (BOOL)isEqual:(id)other {
    if (other == self) {
        return YES;
    } else if ([other isKindOfClass:[CompanyItemModel class]]) {
        CompanyItemModel *casted = (CompanyItemModel *)other;
        return [self.item.identifier isEqualToString:casted.item.identifier];
    } else {
        return NO;
    }
}

- (NSUInteger)hash {
    return self.item.identifier.hash;
}

@end
